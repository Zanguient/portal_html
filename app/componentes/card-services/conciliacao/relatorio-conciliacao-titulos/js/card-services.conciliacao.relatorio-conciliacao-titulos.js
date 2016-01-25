/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 13/11/2015
 *
 */

// App
angular.module("card-services-relatorio-conciliacao-titulos", []) 

.controller("card-services-relatorio-conciliacao-titulosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            '$window',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis', 
                                            '$timeout',
                                            '$filter',
                                            function($scope,$state,$http,$window,/*$campos,*/
                                                     $webapi,$apis,$timeout,$filter){  
    
    $scope.filiais = [];   
    $scope.adquirentes = [];                                            
    $scope.relatorio = [];        
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200];       
    $scope.tipos = [{id: 1, nome: 'FILIAL DIFERENTE'}, {id: 2, nome: 'NÃO CONCILIADO'}];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário             
    $scope.filtro = {datamin : new Date(), datamax : '', 
                     adquirente : undefined, filial : undefined, filialtitulo : undefined, tipo : undefined,
                     itens_pagina : $scope.itens_pagina[1], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };                                             
    $scope.total = { valorTotalBruto : 0.0, valorTotalLiquido : 0.0, filiais : [] };  
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress                                         
    // flags                                   
    $scope.exibeTela = false;         
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                                            
                                                
    // Inicialização do controller
    $scope.cardServices_relatorioConciliacaoTitulosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Conciliação';                          
        $scope.pagina.subtitulo = 'Relatório de Conciliação de Títulos';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.filialtitulo = null;
                    buscaFiliais(true);
                }else{ // reseta tudo e não faz buscas 
                    $scope.filiais = []; 
                    $scope.adquirentes = [];
                    $scope.filtro.filial = $scope.filtro.adquirente = $scope.filtro.filialtitulo = null;
                }
            }
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega filiais
            buscaFiliais(true);
        }); 
        // Acessou a tela
        $scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        //buscaFiliais(true);
    };                                           
                                                
                                            
    
        
                                                
   /* FILTRO */
                                                
   /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // Filtros Por Data
        var filtroData = {id: /*$campos.card.relatorioconciliacaotitulos.data*/ 100,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
        if($scope.filtro.datamax)
               filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
        filtros.push(filtroData);

        // Filial
        if($scope.filtro.filial && $scope.filtro.filial !== null){
           filtros.push({id: /*$campos.card.relatorioconciliacaotitulos.nu_cnpj*/ 102, 
                         valor: $scope.filtro.filial.nu_cnpj});  
        }

        // Adquirente
        if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           filtros.push({id: /*$campos.card.relatorioconciliacaotitulos.cdadquirente*/ 200, 
                         valor: $scope.filtro.adquirente.cdAdquirente});  
        }
        
        // Tipo
        if($scope.filtro.tipo && $scope.filtro.tipo !== null){
           filtros.push({id: /*$campos.card.relatorioconciliacaotitulos.tipo*/ 104, 
                         valor: $scope.filtro.tipo.id});  
        }else
            // Filial do título
            if($scope.filtro.filialtitulo && $scope.filtro.filialtitulo !== null){
               filtros.push({id: /*$campos.card.relatorioconciliacaotitulos.nu_cnpj_titulo*/ 103, 
                         valor: $scope.filtro.filialtitulo.nu_cnpj});  
        }
        
        
        
        return filtros;
    }                                             
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){

        // Limpar data
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.adquirente = $scope.filtro.filialtitulo = null; 
        
        if($scope.filiais.length > 0 && $scope.filtro.filial !== $scope.filiais[0]){
            $scope.filtro.filial = $scope.filiais[0]; 
            buscaAdquirentes(false); 
        }
    }
    
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
       if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
       else ajustaIntervaloDeData();
    };
    
    
                                                 
    
    // FILIAIS
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(buscarAdquirentes, nu_cnpj, cdAdquirente){
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [];

       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1}); 
        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = $scope.filiaisgrupo = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = $scope.filiais[0];
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                if(buscarAdquirentes)//$scope.filtro.filial && $scope.filtro.filial !== null)
                    buscaAdquirentes(true, cdAdquirente); // Busca adquirentes
                else
                    $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial);
        buscaAdquirentes(false);
    };
                                                
                                                
                                                
    // ADQUIRENTES 
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){ 
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
        
       if($scope.filtro.filial && $scope.filtro.filial !== null){
           // Filtro do grupo empresa => barra administrativa
           filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
                         valor: $scope.filtro.filial.nu_cnpj});
       }  
       
       
       $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 0, /*$campos.card.tbadquirente.nmAdquirente*/ 101],
                                filtros)) 
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!cdAdquirente) $scope.filtro.adquirente = null; 
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        // ...
    };                                            
            
                                                
                                                
                                                
                                                
   // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaRelatorioConciliacaoTitulos();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        if($scope.relatorio.length > 0) buscaRelatorioConciliacaoTitulos();
    };                                              
                                                
                                                
                                                
                                                
    
    // RELATÓRIO DE VENDAS                                          
    /**
      * Obtem o relatório a partir dos filtros
      */
    $scope.buscaRelatorioConciliacaoTitulos = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){ $scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.showModalAlerta('É necessário selecionar uma filial!');
           return;
        }
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        // Nova busca
        buscaRelatorioConciliacaoTitulos();
    }
                                                
                                                
    var buscaRelatorioConciliacaoTitulos = function(){
    
        if(!$scope.filtro.filial || $scope.filtro.filial === null)
            return;
        
        // Abre os progress
       $scope.showProgress(divPortletBodyFiltrosPos, 10000); // z-index < z-index do fullscreen     
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       // Filtros    
       var filtros = obtemFiltrosBusca();
           
       //console.log(filtros);
       $webapi.get($apis.getUrl($apis.card.relatorioconciliacaotitulos, [$scope.token, 0], filtros)) 
            .then(function(dados){
                //console.log(dados);
                // Obtém os dados
                $scope.relatorio = dados.Registros;
                // Totais
                $scope.total.valorTotalBruto = dados.Totais.valorTotalBruto;
                $scope.total.valorTotalLiquido = dados.Totais.valorTotalLiquido;
                $scope.total.filiais = [];
                //console.log(dados.Totais);
                // Total por filial
                if(Object.keys(dados.Totais).length > 2){
                    for (var key in dados.Totais) {
                      if (key !== 'valorTotalBruto' && key !== 'valorTotalLiquido' && dados.Totais.hasOwnProperty(key)) {
                          var nome = key.substr(key.indexOf(')') + 2);
                          var tipo = key.substr(1, key.indexOf(')') - 1); 
                          //console.log(nome);
                          //console.log(tipo);
                          var filial = $filter('filter')($scope.total.filiais, function(f){return f.nome === nome})[0];
                          if(filial && filial !== null)
                              // insere a nova chave
                              filial[tipo] = dados.Totais[key];
                          else{
                              // adiciona
                              var f = {nome: nome};
                              f[tipo] = dados.Totais[key];
                              $scope.total.filiais.push(f);
                          }
                      }
                    }
                    //console.log($scope.total.filiais);
                }
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.relatorio.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha os progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter relatório de conciliação de títulos (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
                 $scope.hideProgress(divPortletBodyRelatorioPos);
              });           
    }

        
}]);