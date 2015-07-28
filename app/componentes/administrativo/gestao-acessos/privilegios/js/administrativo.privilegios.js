/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-privilegios", []) 

.controller("administrativo-privilegiosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyPrivilegioPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.privilegios = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.webpagesroles.RoleName,
                            ativo: true,  
                            nome: "Privilégio"
                          },
                          {
                            id: $campos.administracao.webpagesroles.RoleLevel,
                            ativo: true,  
                            nome: "Nível"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.privilegio = {busca:'', campo_busca : $scope.camposBusca[1], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.webpagesroles.RoleName, order : 0}};    
    
    $scope.roleSelecionada = undefined; 
    var controllerPrincipal = undefined;
    var oldControllerPrincipal = undefined;
    $scope.inputCadastro = {titulo : '', nome: '', level : '', funcao : function(){}};
    $scope.originalControllers = [];                                          
    $scope.controllers = [];
    $scope.levels = [];                                            
    // flags
    $scope.cadastraNovoPrivilegio = false; // faz exibir a linha para adicionar um novo privilégio
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                                
                                                
    // Inicialização do controller
    $scope.administrativoPrivilegiosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Privilégios';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Busca Privilégios
        $scope.buscaPrivilegios();
    }; 
                                                
                                                
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar privilégios
      */
    $scope.usuarioPodeCadastrarPrivilegios = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar privilégios
      */
    $scope.usuarioPodeAlterarPrivilegios = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir privilégios
      */
    $scope.usuarioPodeExcluirPrivilegios = function(){
        return permissaoRemocao;
    }                                            
                                                
                                            
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
    };
    /**
      * Ordena por level
      */
    $scope.ordenaPorNivel = function(){
        ordena(1);    
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
    /**
      * Retorna true se a ordenação está sendo feito por nível de forma crescente
      */
    $scope.estaOrdenadoCrescentePorNivel = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[1].id && 
               $scope.privilegio.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nível de forma decrescente
      */
    $scope.estaOrdenadoDecrescentePorNivel = function(){
        return $scope.privilegio.campo_ordenacao.id === $scope.camposBusca[1].id && 
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
    $scope.resetaBusca = function(){
        $scope.privilegio.busca = '';
        $scope.buscaPrivilegios(); 
    };
    $scope.buscaPrivilegios = function(){
       $scope.showProgress(divPortletBodyPrivilegioPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.privilegio.busca.length > 0) filtros = {id: $scope.privilegio.campo_busca.id, 
                                                         valor: $scope.privilegio.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoPrivilegios = true;
       $webapi.get($apis.getUrl($apis.administracao.webpagesroles, [$scope.token, 1, $scope.privilegio.campo_ordenacao.id, 
                                                       $scope.privilegio.campo_ordenacao.order, 
                                                       $scope.privilegio.itens_pagina, $scope.privilegio.pagina],
                   filtros)) 
            .then(function(dados){
                $scope.privilegios = dados.Registros;
                $scope.privilegio.total_registros = dados.TotalDeRegistros;
                $scope.privilegio.total_paginas = Math.ceil($scope.privilegio.total_registros / $scope.privilegio.itens_pagina);
                var registroInicial = ($scope.privilegio.pagina - 1)*$scope.privilegio.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.privilegio.itens_pagina;
                if(registroFinal > $scope.privilegio.total_registros) registroFinal = $scope.privilegio.total_registros;
                $scope.privilegio.faixa_registros =  registroInicial + '-' + registroFinal;
                $scope.obtendoPrivilegios = false;
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
    var obtemLevels = function(funcao){
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.get($apis.getUrl($apis.administracao.webpagesrolelevels, 
                                 [$scope.token, 0,$campos.administracao.webpagesrolelevels.LevelId])) 
            .then(function(dados){
                $scope.levels = dados.Registros;
                if(typeof funcao === 'function') funcao();
                $scope.hideProgress(divPortletBodyPrivilegioPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar níveis de privilégios (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyPrivilegioPos);
              });     
    };
    var exibeModalInputPrivilegio = function(){
        $('#modalInputPrivilegio').modal('show');    
    };
    var fechaModalInputPrivilegio = function(){
        $('#modalInputPrivilegio').modal('hide');    
    };                                            
    /**
      * Exibe cadastro novo privilégio
      */
    $scope.exibeCadastroNovoPrivilegio = function(exibe){
        $scope.inputCadastro.titulo = 'Cadastro de privilégio';
        $scope.inputCadastro.nome = '';
        $scope.inputCadastro.level = '';
        $scope.funcao = $scope.addPrivilegio;
        // Exibe o modal
        if($scope.levels.length > 0)
            exibeModalInputPrivilegio();
        else{
            // Obtém levels
            obtemLevels(function(){ exibeModalInputPrivilegio()});
        }
    }
    /**
      * Valida dados informados para cadastro de novo privilégio e cadastra, se válido
      */
    $scope.addPrivilegio = function(){
        if(!$scope.inputCadastro.level || typeof $scope.inputCadastro.level.LevelId !== 'number'){
            $scope.showModalAlerta('Selecione um nível');
            return;
        };
        if(!$scope.inputCadastro.nome){
            $scope.showModalAlerta('Informe um nome');
            return;
        }
        if($scope.inputCadastro.nome.length < 3){
            //alert('Nome muito curto!');
            $scope.showModalAlerta('Nome muito curto!');
            return;    
        }
        $scope.showProgress();
        $webapi.get($apis.getUrl($apis.administracao.webpagesroles, 
                                 [$scope.token], 
                                 {id: $campos.administracao.webpagesroles.RoleName,
                                  valor: $scope.inputCadastro.nome})) 
            .then(function(dados){
                if(dados.Registros.length > 0){
                    $scope.showModalAlerta('Já existe um privilégio com esse nome!');
                    $scope.hideProgress();
                    return;     
                }
                // Fecha o modal input
                $scope.hideProgress();
                $scope.fechaModalInput();
                // Atualiza
                addPrivilegio($scope.inputCadastro.nome, $scope.inputCadastro.level.LevelId);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao consultar privilégio (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress();
              });     
    };
    /**
      * Adiciona privilégio
      */
    var addPrivilegio = function(novoPrivilegio, roleLevel){
        // Envia para o banco
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.post($apis.getUrl($apis.administracao.webpagesroles, undefined, 
                                  {id: 'token', valor: $scope.token}), {RoleName : novoPrivilegio,
                                                                        RoleLevel : roleLevel})
                .then(function(dados){
                    $scope.showAlert('Privilégio cadastrado com sucesso!', true, 'success', true);
                    // Reseta o campo
                    //$scope.novoPrivilegio = '';
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                    // Não aparece mais a linha de cadastro
                    //$scope.exibeCadastroNovoPrivilegio(false);
                    // Relista os privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 401) $scope.showModalAlerta('Você não possui privilégios para criar um privilégio com esse nível');
                     else $scope.showAlert('Houve uma falha ao cadastrar o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  }); 
    }
    /**
      * Altera o nome do privilégio
      */
    $scope.alteraPrivilegio = function(privilegio){
        $scope.inputCadastro.titulo = 'Alteração de privilégio';
        $scope.inputCadastro.nome = privilegio.RoleName;
        $scope.inputCadastro.level = privilegio.RoleLevels;
        $scope.funcao = alteraPrivilegio;
        // Exibe o modal
        if($scope.levels.length > 0){
            if(privilegio.RoleLevels){ 
                var l = $filter('filter')($scope.levels, function(l){ return l.LevelId === privilegio.RoleLevels.LevelId });   
                if(l.length > 0) $scope.inputCadastro.level = l[0];
            }
            exibeModalInputPrivilegio();
        }else{
            // Obtém levels
            obtemLevels(function(){ 
                                    if(privilegio.RoleLevels){ 
                                        var l = $filter('filter')($scope.levels, function(l){ return l.LevelId === privilegio.RoleLevels.LevelId });   
                                        if(l.length > 0) $scope.inputCadastro.level = l[0];
                                    }
                                    exibeModalInputPrivilegio()
                        });
        }
    };
    /**
      * Valida dados informados para alteração do privilégio e altera, se válido
      */
    var alteraPrivilegio = function(){
        // Verifica se houve alteração
        if($scope.inputCadastro.nome === privilegio.RoleName && 
           $scope.inputCadastro.level.LevelId === privilegio.RoleLevels.LevelId){
            // Não alterou => Nada faz
            $scope.fechaModalInput();
            return;
        }
        if(!$scope.inputCadastro.level || typeof $scope.inputCadastro.level.LevelId !== 'number'){
            $scope.showModalAlerta('Selecione um nível');
            return;
        };
        if(!$scope.inputCadastro.nome){
            $scope.showModalAlerta('Informe um nome');
            return;
        }
        if($scope.inputCadastro.nome.length < 3){
            $scope.showModalAlerta('Nome muito curto!');
            return;    
        }
        // Verifica se o nome é único
        if($scope.inputCadastro.nome.toUpperCase() === privilegio.RoleName.toUpperCase()){
            $scope.fechaModalInput();
            // Atualiza
            atualizaNomePrivilegio(privilegio, text);
        }else{
            $scope.showProgress();
            $webapi.get($apis.getUrl($apis.administracao.webpagesroles, 
                                     [$scope.token], 
                                     {id: $campos.administracao.webpagesroles.RoleName,
                                      valor: $scope.inputCadastro.nome})) 
                .then(function(dados){
                    if(dados.Registros.length > 0){
                        $scope.showModalAlerta('Já existe um privilégio com esse nome!');
                        $scope.hideProgress();
                        return;     
                    }
                    // Fecha o modal input
                    $scope.hideProgress();
                    $scope.fechaModalInput();
                    // Atualiza
                    atualizaNomePrivilegio(privilegio, $scope.inputCadastro.nome, $scope.inputCadastro.level.LevelId);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else $scope.showAlert('Houve uma falha ao consultar privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress();
                  }); 
        }    
    };
    /**
      * Atualiza efetivamente o nome do privilégio
      */
    var atualizaNomePrivilegio = function(privilegio, novoNome, level){
        $scope.showProgress(divPortletBodyPrivilegioPos);
        var jsonPrivilegio = {RoleId : privilegio.RoleId, RoleName : novoNome, RoleLevel : level};
        console.log(jsonPrivilegio);
        $webapi.update($apis.getUrl($apis.administracao.webpagesroles, undefined,
                       {id: 'token', valor: $scope.token}), jsonPrivilegio)
            .then(function(dados){
                    $scope.showAlert('Privilégio alterado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                    // Relista os privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 401) $scope.showModalAlerta('Você não possui privilégios para criar um privilégio com esse nível');
                         
                     else $scope.showAlert('Houve uma falha ao alterar o privilégio (' + failData.status + ')', true, 'danger', true); 
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  });  
    };
    /**
      * Exibe as funcionalidades associadas ao privilégio
      */
    $scope.exibeFuncionalidades = function(privilegio){
        // Reseta permissões
        //$scope.permissoes = [];
        $scope.roleSelecionada = privilegio;
        // Exibe o modal
        $('#modalFuncionalidades').modal('show');
        // Carrega as permissões
        obtemModulosEFuncionalidades();
        
    }; 
    /**
      * Excluir privilégio
      */                                            
    var exluirPrivilegio = function(RoleId){
        // Deleta
        $scope.showProgress(divPortletBodyPrivilegioPos);
        $webapi.delete($apis.getUrl($apis.administracao.webpagesroles, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'RoleId', valor: RoleId}]))
            .then(function(dados){
                    $scope.showAlert('Privilégio deletado com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyPrivilegioPos);
                    // atualiza tela de privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else $scope.showAlert('Houve uma falha ao excluir o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyPrivilegioPos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o privilégio
      */                                                                              
    $scope.exluirPrivilegio = function(privilegio){
        // Envia post para deletar
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + privilegio.RoleName,
                         exluirPrivilegio, privilegio.RoleId,
                         'Sim', 'Não');
    };    
                                                
                                                
    
    // CONTROLLERS E METHODS
    /**
      * Retorna true se o controller é a página inicial
      */
    $scope.ehPaginaPrincipal = function(controller){
        if(!controller || !controllerPrincipal) return false;
        return controllerPrincipal.id_controller === controller.id_controller;    
    };
    /**
      * Define o controller como página inicial
      */
    $scope.definirPaginaInicial = function(controller){
        if(!controller){
            if(controllerPrincipal) controllerPrincipal.principal = false;
            controllerPrincipal = undefined;
        }else if(!$scope.ehPaginaPrincipal()){
            if(controllerPrincipal) controllerPrincipal.principal = false;
            controller.principal = true;
            controllerPrincipal = controller; // aponta para o novo controller principal
        }
    };
    /**
      *  Marca/Desmarca todos métodos do controller se method is undefined.
      *  Caso contrário, marca/desmarca somente o método de mesmo ds_method de method
      */                                            
    var  selecionaMetodosDoController = function(controller, method){
        var check = controller.selecionado;
        if(controller.methods){ 
            // Marca/Desmarca todos os métodos
            for(var k = 0; k < controller.methods.length; k++){
                var m = controller.methods[k];
                if(!method) m.selecionado = check; 
                else if(m.ds_method.toUpperCase() === method.ds_method.toUpperCase()) m.selecionado = method.selecionado;
            }
        }
    }
    /**
      *  Seleciona os métodos e, caso o controller não esteja marcado, desmarca todos a partir os seus filhos
      */
    var selecionaController = function(controller, method){
        // Marca/Desmarca método(s) do controller
        selecionaMetodosDoController(controller, method);
        if($filter('filter')(controller.methods, function(m){return m.selecionado === true;}).length == 0)
            controller.selecionado = false;
        var check = controller.selecionado;
        // Tem sub controllers?
        if(!check && controller.subControllers){
            // Desmarca cada subcontroller, seus métodos e todos os seus filhos
            for(var k = 0; k < controller.subControllers.length; k++){
                var sub = controller.subControllers[k];
                sub.selecionado = false;
                selecionaController(sub, method); // recursivo
            }
        }else if(method && !method.selecionado && controller.subControllers){
            // Marca o método de cada subcontroller
            for(var k = 0; k < controller.subControllers.length; k++){
                selecionaController(controller.subControllers[k], method); // recursivo
            }
        }
    };
    /**
      * Manuseia a mudança de uso do controller 
      */
    $scope.handleCheckController = function(controller){
        if(!controller) return;
        //console.log(angular.equals($scope.originalControllers, $scope.controllers));
        if(angular.isArray(controller)){
            // é um controller filho
            var ctrlFilho = controller[0];
            var check = ctrlFilho.selecionado;
            // Se ele acabou de ser marcado => marca os pais
            if(check){
                var methodsNaoMarcadosNosPais = [];
                for(var k = controller.length; k > 1; k--){ 
                   var ctrl = controller[k - 1];
                   ctrl.selecionado = true;
                   // Verifica se tem algum método selecionado do controller
                   if($filter('filter')(ctrl.methods, function(m){return m.selecionado === true;}).length == 0){
                       // Não tem método selecionado => seleciona tudo
                       selecionaMetodosDoController(ctrl);
                       methodsNaoMarcadosNosPais = [];
                       //var methodPaisUpper = methodsPais.map(function(x) { return x.toUpperCase(); });
                   }else{ 
                       var methodsNaoSelecionados = $filter('filter')(ctrl.methods, function(m){return m.selecionado === false;});
                       // Adiciona aos métodos não marcados nos pais
                       for(var j = 0; j < methodsNaoSelecionados.length; j++){
                           var m = methodsNaoSelecionados[j];
                           if($filter('filter')(methodsNaoMarcadosNosPais, m.ds_method.toUpperCase()).length == 0)
                                methodsNaoMarcadosNosPais.push(m.ds_method.toUpperCase());
                       }
                   }
                }
                // Finalmente, marca os métodos do controller selecionado
                for(var k = 0; k < ctrlFilho.methods.length; k++){
                    var m = ctrlFilho.methods[k];
                    if($filter('filter')(methodsNaoMarcadosNosPais, m.ds_method.toUpperCase()).length == 0)
                        m.selecionado = true;
                }
            }else selecionaController(ctrlFilho); // desmarca todos abaixo dele
        }else
            // Desmarca do controller para baixo ou apenas marca ele
            selecionaController(controller);
    }
    /**
      * Manuseia a mudança de uso do método do controller 
      */
    $scope.handleCheckMethod = function(method, controller){
        if(!method.selecionado){
            // Verifica se ainda tem algum método selecionado
            if($filter('filter')(controller.methods, function(m){return m.selecionado === true;}).length == 0){
                // Não tem mais métodos selecionados => Desmarca o controller
                controller.selecionado = false;
                selecionaController(controller);
            }else{
                //console.log("DESMARCA " + method.ds_method + " FILHOS");
                // todos os filhos não poderão ter esse método assinalado
                selecionaController(controller, method);
            }
        }else{
            // todos os pais terão que ter esse método assinalado
            var controllers = $scope.controllers;
            for(var k = controller.parents.length; k > 0; k--){
                var ctrl = ($filter('filter')(controllers, {id_controller:controller.parents[k - 1]}))[0];
                selecionaMetodosDoController(ctrl, method);
                controllers = ctrl.subControllers ? ctrl.subControllers : [];
            }
        }
    }
    /**
      * Carrega todos os módulos e respectivas funcionalidades
      */
    var obtemModulosEFuncionalidades = function(){
       //$scope.obtendoModulosEFuncionalidades = true;
       $scope.showProgress();
       $webapi.get($apis.getUrl($apis.administracao.webpagescontrollers, [$scope.token, 3,       
                                                             $campos.administracao.webpagescontrollers.ds_controller], 
                   {id : $campos.administracao.webpagescontrollers.RoleId, valor: $scope.roleSelecionada.RoleId})) 
            .then(function(dados){
                $scope.controllers = dados.Registros;
                // Reseta valores
                controllerPrincipal = undefined;
                oldControllerPrincipal = undefined;
                // set selecionado dos controllers e transforma o array em uma estrutura de árvore
                obtemEstruturaArvore($scope.controllers);
                // Faz uma cópia (por valor) do controller proveniente da base de dados
                angular.copy($scope.controllers, $scope.originalControllers);
                oldControllerPrincipal = controllerPrincipal;
                //$scope.obtendoModulosEFuncionalidades = false;
                $scope.hideProgress();
              },
              function(failData){
                 //$scope.obtendoModulosEFuncionalidades = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar módulos e funcionalidades (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress();
              }); 
        
        /*$scope.controllers = [{id_controller: 50,
                               ds_controller: 'Administração',
                               methods: [{id_method : 100,
                                          ds_method : 'Atualização'},
                                         {id_method : 101,
                                          ds_method : 'Leitura'},
                                        ],
                               subControllers : [
                                  {id_controller: 51,
                                   ds_controller: 'Gestão de Acessos',
                                   methods: [{id_method : 102,
                                              ds_method : 'Atualização'},
                                             {id_method : 103,
                                              ds_method : 'Leitura'},
                                            ],
                                   subControllers : [
                                       {id_controller: 53,
                                        ds_controller: 'Usuários',
                                        methods: [{id_method : 110,
                                                  ds_method : 'Atualização'},
                                                 {id_method : 111,
                                                  ds_method : 'Leitura'}]
                                       },
                                       {id_controller: 54,
                                        ds_controller: 'Privilégios',
                                        methods: [{id_method : 112,
                                                  ds_method : 'Atualização'},
                                                 {id_method : 113,
                                                  ds_method : 'Leitura'}]
                                       }

                                   ]
                                  },
                                  {id_controller: 52,
                                   ds_controller: 'Logs',
                                   methods: [{id_method : 104,
                                              ds_method : 'Cadastro'},
                                             {id_method : 105,
                                              ds_method : 'Leitura'},
                                            ],
                                   subControllers : [

                                   ]
                                  }   
                               ]
                              }];
        obtemEstruturaArvore($scope.controllers);
        angular.copy($scope.controllers, $scope.originalControllers);*/
    };
    /**
      * Do conjunto de controllers, seleciona os elementos que tem métodos permitidos e transforma a estrutura em árvore
      */
    var obtemEstruturaArvore = function(controllers, parents){
        if(!controllers || controllers.length == 0) return;
        if(typeof parents === 'undefined') parents = []; 
        for(var k = 0; k < controllers.length; k++){
            var controller = controllers[k];
            // Seta os pais
            controller.parents = parents;
            // Indica se ele está marcado
            controller.selecionado = $filter('filter')(controller.methods, function(m){return m.selecionado === true;}).length > 0;
            // Faz isso com os filhos                   adiciona os pais na ordem do mais imediato até o raiz
            if(controller.subControllers) obtemEstruturaArvore(controller.subControllers, 
                                                               [controller.id_controller].concat(parents));
            // É o principal ?
            if(!controllerPrincipal && controller.principal) controllerPrincipal = controller;
        }
    };
    /**
      * Retoma as permissões que estão salvas na base de dados
      */
    $scope.resetaPermissoes = function(){
        angular.copy($scope.originalControllers, $scope.controllers);    
    };
    /**
      * Salva as permissões
      */
    $scope.salvaPermissoes = function(){
        // Guarda as permissões
        var permissoes = {id_roles : $scope.roleSelecionada.RoleId,
                          inserir : [],
                          deletar : [],
                          id_controller_principal : controllerPrincipal ? controllerPrincipal.id_controller : null,
                         };
        
        /*if(typeof controllerPrincipal == 'undefined'){
            $scope.showModalAlerta('Selecione uma página principal!'); 
            return;    
        }*/
        
        // Armazena somente as que tiveram alterações
        obtemPermissoesModificadas($scope.controllers, $scope.originalControllers, permissoes);
        
        // Verifica se tiveram alterações
        if(permissoes.inserir.length == 0 && permissoes.deletar.length == 0 && oldControllerPrincipal === controllerPrincipal){ 
            console.log("NÃO HOUVE ALTERAÇÕES");
            // Fecha o modal
            $('#modalFuncionalidades').modal('hide');
        }else{ 
            $scope.showProgress();

            $webapi.update($apis.getUrl($apis.administracao.webpagespermissions, undefined,
                           {id: 'token', valor: $scope.token}), permissoes)
                .then(function(dados){
                        $scope.showAlert('Permissões salvas com sucesso!', true, 'success', true);
                        $scope.hideProgress();
                        // Fecha o modal
                        $('#modalFuncionalidades').modal('hide');
                      },function(failData){
                         if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                         else $scope.showAlert('Houve uma falha ao salvar permissões (' + failData.status + ')', true, 'danger', true); 
                        $scope.hideProgress();
                      });  
        }
    }; 
    /**
      * Comparando cada método dos controllers novo e original, armazena no array permissoes somente as que foram modificadas
      */
    var obtemPermissoesModificadas = function(newControllers, originalControllers, permissoes){
        for(var k = 0; k < newControllers.length; k++){
            var novo = newControllers[k];
            var original = originalControllers[k];
            armazenaPermissoesModificadas(novo, original, permissoes);
            // Percorre os filhos
            if(novo.subControllers) obtemPermissoesModificadas(novo.subControllers, original.subControllers, permissoes);
        }    
    };
    /**
      * Armazena no array permissoes somente os métodos que foram modificados quanto à seleção
      */                                            
    var armazenaPermissoesModificadas = function(newController, originalController, permissoes){
        for(var k = 0; k < newController.methods.length; k++){
            var novo = newController.methods[k];    
            var original = originalController.methods[k];
            // Evitar erros
            if(novo.selecionado === undefined) novo.selecionado = false;
            if(original.selecionado === undefined) original.selecionado = false;
            // Compara
            if(novo.selecionado !== original.selecionado){
                //console.log("DIFERENTES!");
                if(!novo.selecionado)
                    // Coloca no array de remoções
                    permissoes.deletar.push(novo.id_method);
                else
                    // Coloca no array de inserções
                    permissoes.inserir.push(novo.id_method);
            }
        }
    };

}])