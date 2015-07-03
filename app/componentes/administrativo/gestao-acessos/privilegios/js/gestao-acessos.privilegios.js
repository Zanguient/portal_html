/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-privilegios", ['servicos']) 

.controller("administrativo-privilegiosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter',
                                            '$autenticacao', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter,$autenticacao){ 
   
    var divPortletBodyPrivilegioPos = 0; // posição da div que vai receber o loading progress
    var token = '';
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.privilegios = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.webpagesroles.RoleName,
                            ativo: true,  
                            nome: "Privilégio"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.privilegio = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpagesroles.RoleName, order : 0}};    
    $scope.permissoes = [];     
    $scope.novoPrivilegio = ''; // cadastro
    // flags
    $scope.cadastraNovoPrivilegio = false; // faz exibir a linha para adicionar um novo privilégio
                                                
    // Inicialização do controller
    $scope.administrativoPrivilegiosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Privilégios';
        // Token
        token = $autenticacao.getToken();
        // Busca Privilégios
        $scope.buscaPrivilegios();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 
                                            
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.privilegio.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.privilegio.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.privilegio.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.privilegio.campo_ordenacao.order = $scope.privilegio.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaPrivilegios(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.privilegio.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.privilegio.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.privilegio.total_paginas){ 
           $scope.privilegio.pagina = pagina;
           $scope.buscaPrivilegios(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.privilegio.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.privilegio.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.privilegio.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaPrivilegios();   
    };
     
    // BUSCA
    $scope.filtraPrivilegios = function(filtro){
        $scope.privilegio.busca = filtro;
        $scope.buscaPrivilegios();
    };
    $scope.buscaPrivilegios = function(){
       $scope.showProgress(divPortletBodyPrivilegioPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.privilegio.busca.length > 0) filtros = {id: $scope.privilegio.campo_busca.id, valor: '%' + $scope.privilegio.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoPrivilegios = true;
       var dadosAPI = $webapi.get($apis.administracao.webpagesroles, [token, 0, $scope.privilegio.campo_ordenacao.id, 
                                                                     $scope.privilegio.campo_ordenacao.order, 
                                                                     $scope.privilegio.itens_pagina, $scope.privilegio.pagina],
                                  filtros); 
       dadosAPI.then(function(dados){
                $scope.privilegios = dados.Registros;
                $scope.privilegio.total_registros = dados.TotalDeRegistros;
                $scope.privilegio.total_paginas = Math.ceil($scope.privilegio.total_registros / $scope.privilegio.itens_pagina);
                var registroInicial = ($scope.privilegio.pagina - 1)*$scope.privilegio.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.privilegio.itens_pagina;
                if(registroFinal > $scope.privilegio.total_registros) registroFinal = $scope.privilegio.total_registros;
                $scope.privilegio.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoPrivilegios = false;
                //$scope.hideAlert(); // fecha o alert
                $scope.hideProgress(divPortletBodyPrivilegioPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.privilegio.pagina > $scope.privilegio.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 $scope.obtendoPrivilegios = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar privilégios (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyPrivilegioPos);
              }); 
    };
        
                                                                                       
                                                
    // AÇÕES
    /**
      * Exibe cadastro novo privilégio
      */
    $scope.exibeCadastroNovoPrivilegio = function(exibe){
        $scope.cadastraNovoPrivilegio = exibe === undefined || exibe ? true : false;
        $scope.novoPrivilegio = '';
    }
    /**
      * Adiciona privilégio
      */
    $scope.addPrivilegio = function(){
       if(!$scope.novoPrivilegio){
           $scope.showAlert('Insira um nome!',true,'danger',true); 
           return;   
       }
       console.log("Nome: " + $scope.novoPrivilegio);
    }
    /**
      * Exibe as funcionalidades associadas ao privilégio
      */
    $scope.exibeFuncionalidades = function(privilegio){
        // Reseta permissões
        $scope.permissoes = [];
        // Exibe o modal
        $('#modalFuncionalidades').modal('show');
        // Carrega as permissões
        console.log(privilegio);
    }; 
    /**
      * Excluir privilégio
      */                                            
    var exluirPrivilegio = function(RoleId){
        // Deleta
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.delete($apis.administracao.webpagesroles,
                       [{id: 'token', valor: token},{id: 'RoleId', valor: RoleId}])
            .then(function(dados){
                    $scope.showAlert('Privilégio deletado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                    // atualiza tela de privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao requisitar privilégios (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o privilégio
      */                                                                              
    $scope.exluirPrivilegio = function(privilegio){
        // Envia post para deletar
        $scope.showModal('Confirmação', 
                         'Tem certeza que deseja excluir ' + privilegio.RoleName,
                         exluirPrivilegio, privilegio.RoleName,
                         'Sim', 'Não');
    };                                               

}])